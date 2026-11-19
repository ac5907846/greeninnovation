"""Write the data file of the web app from the analysis results (aggregated values only).

Inputs:  02_analysis/*/results/*.csv and *.json (no respondent-level rows are read)
Outputs: 05_web_app/data/study.json
Method:  one JSON with the items, the mean ratings by firm type, the 13 by 8 correlation matrix, the
         eight stepwise models with their coefficients and bootstrap stability, the robustness
         summary, the sample profile and the five case-study firms. Numbers keep four decimals.
Usage:   python build_data.py
"""
import json
import sys
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
A = HERE.parent / "02_analysis"
sys.path.insert(0, str(A / "00_shared"))
from constants import FIRM_TYPES, GIF, GIF_FAMILY, LABEL, PROFILE_VARS, SHORT, SSI  # noqa: E402

R1 = A / "01_sample_profile_and_cronbach_alpha (table 1, table 2)" / "results"
R2 = A / "02_gif_mean_score_ranking_anova_spearman (table 4, fig 3)" / "results"
R3 = A / "03_pearson_correlation_gif_ssi (table 5)" / "results"
R4 = A / "04_stepwise_regression_gif_on_ssi (table 6, fig 4)" / "results"
R5 = A / "05_ssi_anova_by_firm_type (table 7)" / "results"
R6 = A / "06_case_study_five_firms (table 3, fig 5)" / "results"
R7 = A / "07_robustness_selection_stability_and_bias_checks (table 8)" / "results"


def r4(x):
    return None if pd.isna(x) else round(float(x), 4)


def main():
    family = {x: f for f, items in GIF_FAMILY.items() for x in items}
    t4 = pd.read_csv(R2 / "table4_means_ranks_anova.csv").set_index("item")
    t8 = pd.read_csv(R5 / "table7_ssi_means_anova.csv").set_index("item")
    pear = pd.read_csv(R3 / "table5_pearson_r.csv", index_col=0)
    coef = pd.read_csv(R4 / "table6_coefficients.csv")
    models = pd.read_csv(R4 / "table6_models.csv").set_index("ssi")
    boot = pd.read_csv(R7 / "bootstrap_inclusion_frequency.csv", index_col=0)
    checks = pd.read_csv(R7 / "final_model_checks.csv").set_index(["ssi", "gif"])
    sub = pd.read_csv(R7 / "without_uniform_respondents.csv").fillna("").set_index("ssi")
    prof = pd.read_csv(R1 / "table2_profile.csv")
    rel = json.load(open(R1 / "reliability.json"))
    quality = json.load(open(R1 / "data_quality.json"))
    s2 = json.load(open(R2 / "summary.json"))
    s7 = json.load(open(R7 / "summary.json"))
    cases = pd.read_csv(R6 / "case_scores.csv")
    s6 = json.load(open(R6 / "summary.json"))

    groups = ["total"] + FIRM_TYPES
    gifs = [{"code": x, "short": SHORT[x], "label": LABEL[x], "family": family[x],
             "mean": {g: r4(t4.loc[x, f"mean_{g}"]) for g in groups},
             "rank": {g: int(t4.loc[x, f"rank_{g}"]) for g in groups},
             "anova_F": r4(t4.loc[x, "anova_F"]), "anova_p": r4(t4.loc[x, "anova_p"]),
             "anova_p_holm": r4(t4.loc[x, "anova_p_holm"])} for x in GIF]
    ssis = []
    for y in SSI:
        c = coef[coef["ssi"] == y]
        const = c[c["variable"] == "Constant"].iloc[0]
        preds = []
        for r in c[c["variable"] != "Constant"].itertuples():
            preds.append({"gif": r.variable, "step": int(r.step), "B": r4(r.B), "SE": r4(r.SE), "beta": r4(r.beta),
                          "t": r4(r.t), "p": r4(r.p), "ci": [r4(r.ci_low), r4(r.ci_high)], "VIF": r4(r.VIF),
                          "boot": r4(boot.loc[r.variable, y]), "p_hc3": r4(checks.loc[(y, r.variable), "p_hc3"]),
                          "kept_without_uniform": r.variable in sub.loc[y, "subsample_predictors"].split()})
        m = models.loc[y]
        ssis.append({"code": y, "short": SHORT[y], "label": LABEL[y],
                     "mean": {g: r4(t8.loc[y, f"mean_{g}"]) for g in groups},
                     "anova_p": r4(t8.loc[y, "anova_p"]),
                     "model": {"const": r4(const.B), "predictors": preds, "R2": r4(m["R2"]),
                               "adjR2": r4(m["adj_R2"]), "F": r4(m["F"]), "dw": r4(m["durbin_watson"]),
                               "R2_without_uniform": r4(sub.loc[y, "R2_subsample"])}})
    data = {
        "meta": {"n": quality["n"], "distributed": quality["distributed"], "returned": quality["returned"],
                 "response_rate": r4(quality["response_rate_percent"]), "alpha_gif": r4(rel["GIF"]["alpha"]),
                 "alpha_ssi": r4(rel["SSI"]["alpha"]), "n_boot": s7["n_boot"],
                 "n_uniform": s7["n_uniform_respondents"], "n_without_uniform": s7["n_subsample"],
                 "harman": r4(s7["harman"]["first_component_share"]),
                 "links": s7["links"], "links_boot_50": s7["links_inclusion_at_least_.50"],
                 "links_hc3": s7["links_hc3_below_.05"], "links_kept_without_uniform": s7["links_retained_without_uniform"],
                 "spearman_min": r4(s2["spearman_min"]), "spearman_max": r4(s2["spearman_max"]),
                 "n_by_group": s2["n_by_group"], "country": "Vietnam"},
        "families": list(GIF_FAMILY),
        "firm_types": FIRM_TYPES,
        "gifs": gifs,
        "ssis": ssis,
        "pearson": {x: {y: r4(pear.loc[x, y]) for y in SSI} for x in GIF},
        "boot": {x: {y: r4(boot.loc[x, y]) for y in SSI} for x in GIF},
        "profile": [{"variable": v, "categories": [{"name": r.category, "n": int(r.n), "percent": r4(r.percent)}
                                                   for r in prof[prof["variable"] == v].itertuples()]}
                    for v in PROFILE_VARS],
        "cases": {"firms": [{"firm": r.firm, "type": r.firm_note, "green_projects": int(r.green_projects),
                             "practice": r4(r.practice_six_key_gifs), "performance": r4(r.performance_eight_ssis)}
                            for r in cases.itertuples()],
                  "spearman": r4(s6["spearman_rho"])},
    }
    out = HERE / "data"
    out.mkdir(exist_ok=True)
    text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    (out / "study.json").write_text(text, encoding="utf-8")
    print(f"study.json: {len(text) / 1024:.1f} kB, {len(gifs)} GIFs, {len(ssis)} SSIs")


if __name__ == "__main__":
    main()
