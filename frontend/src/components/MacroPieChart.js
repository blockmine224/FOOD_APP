import React from "react";
import { Box, Typography, Stack, Chip, Grid } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, ChartTooltip, Legend);

export default function MacroPieChart({
  macroTargets,
  microTotals,
  microTargets,
  showExplanation = true,
  chartTitle = "Phân bổ năng lượng"
}) {
  if (!macroTargets || !microTotals || !microTargets) return null;

  const macros = [
    { name: "Protein", grams: macroTargets.protein_g, percent: macroTargets.protein_percent, kcal: Math.round(macroTargets.protein_g * 4), color: "#6366f1", explain: "Giúp xây dựng cơ bắp" },
    { name: "Béo", grams: macroTargets.fat_g, percent: macroTargets.fat_percent, kcal: Math.round(macroTargets.fat_g * 9), color: "#f59e42", explain: "Cung cấp năng lượng, hấp thu vitamin" },
    { name: "Carb", grams: macroTargets.carb_g, percent: macroTargets.carb_percent, kcal: Math.round(macroTargets.carb_g * 4), color: "#22d3ee", explain: "Nguồn năng lượng chính" },
  ];
  const micros = [
    { name: "Cholesterol", value: microTotals.cholesterol_mg, target: microTargets.cholesterol_mg, unit: "mg", color: "#d7263d", explain: "Nên hạn chế để bảo vệ tim mạch" },
    { name: "Natri", value: microTotals.sodium_mg, target: microTargets.sodium_mg, unit: "mg", color: "#f7b801", explain: "Hạn chế để ngừa tăng huyết áp" },
    { name: "Chất xơ", value: microTotals.fiber_g, target: microTargets.fiber_g, unit: "g", color: "#1f8a70", explain: "Tốt cho tiêu hóa" },
  ];

  const doughnutData = {
    labels: [...macros.map(m => m.name), ...micros.map(m => m.name)],
    datasets: [
      {
        data: [
          ...macros.map(m => m.kcal),
          ...micros.map(m => m.value)
        ],
        backgroundColor: [
          ...macros.map(m => m.color),
          ...micros.map(m => m.color)
        ],
        borderWidth: 3,
        borderColor: "#fff"
      }
    ]
  };

  const totalKcal = macros.reduce((acc, m) => acc + m.kcal, 0);

  const allExplains = [...macros, ...micros];
  const mid = Math.ceil(allExplains.length / 2);
  const leftExplanations = allExplains.slice(0, mid);
  const rightExplanations = allExplains.slice(mid);

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      <Grid container alignItems="center" justifyContent="center" spacing={2}>
        {showExplanation && (
          <Grid item xs={12} sm={3}>
            <Stack spacing={2} alignItems="flex-end">
              {leftExplanations.map((m) => (
                <Chip
                  key={m.name}
                  label={
                    <span>
                      <b>{m.name}</b>
                      {m.grams !== undefined && <>: {m.grams}g ({Math.round(m.percent*100)}%)</>}
                     {m.value !== undefined && <>: {m.value}{m.unit} {m.target && <>(≤{m.target}{m.unit})</>}</>}
                      {" – " + m.explain}
                    </span>
                  }
                  sx={{
                    background: m.color,
                    color: "#fff",
                    fontWeight: 500,
                    fontSize: 14,
                    px: 2,
                    py: 0.5,
                    py: 1,
                    mb: 0.5,
                    whiteSpace: "normal",
                    height: "auto",
                    alignItems: "flex-start",
                    "& .MuiChip-label": {
                      display: "block",
                      whiteSpace: "normal",
                      overflow: "visible",
                    },
                  }}
                  variant="filled"
                />
              ))}
            </Stack>
          </Grid>
        )}
        <Grid item xs={12} sm={6} sx={{ textAlign: "center" }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, letterSpacing: 1 }}>
            {chartTitle}
          </Typography>
          <Box sx={{
            width: { xs: 240, sm: 160 },
            height: { xs: 240, sm: 160 },
            mx: "auto",
            position: "relative",
            background: "linear-gradient(135deg, #f3faff 0%, #e0e7ff 100%)",
            borderRadius: "50%",
            boxShadow: "0 8px 32px 0 rgba(80,90,130,0.15)"
          }}>
            <Doughnut
              data={doughnutData}
              options={{
                cutout: "40",
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const idx = context.dataIndex;
                        if (idx < 3) {
                          const m = macros[idx];
                          return `${m.name}: ${m.kcal} kcal (${m.grams}g, ${Math.round(m.percent*100)}%)`;
                        } else {
                          const m = micros[idx - 3];
                          return `${m.name}: ${m.value}${m.unit} (≤${m.target}${m.unit})`;
                        }
                      }
                    }
                  }
                },
                animation: { animateRotate: true, animateScale: true },
                maintainAspectRatio: false,
              }}
            />
            <Box sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -58%)",
              textAlign: "center",
              pointerEvents: "none"
            }}>
              <Typography variant="subtitle2" fontWeight={700} color="#232323" sx={{ letterSpacing: 1 }}>
                Tổng<br />{totalKcal} kcal
              </Typography>
            </Box>
          </Box>
        </Grid>
        {showExplanation && (
          <Grid item xs={12} sm={3}>
           <Stack spacing={2} alignItems="flex-end">
              {rightExplanations.map((m) => (
                <Chip
                  key={m.name}
                  label={
                    <span>
                      <b>{m.name}</b>
                      {m.grams !== undefined && <>: {m.grams}g ({Math.round(m.percent*100)}%)</>}
                     {m.value !== undefined && <>: {m.value}{m.unit} {m.target && <>(≤{m.target}{m.unit})</>}</>}
                      {" – " + m.explain}
                    </span>
                  }
                  sx={{
                    background: m.color,
                    color: "#fff",
                    fontWeight: 500,
                    fontSize: 14,
                    px: 2,
                    py: 0.5,
                    py: 1,
                    mb: 0.5,
                    whiteSpace: "normal",
                    height: "auto",
                    alignItems: "flex-start",
                    "& .MuiChip-label": {
                      display: "block",
                      whiteSpace: "normal",
                      overflow: "visible",
                    },
                  }}
                  variant="filled"
                />
              ))}
            </Stack>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}