import type { EnergyStat, EnergyMonth } from '@/types';
import buildings from './buildings';

const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];

function generateMonthData(month: string, buildingIndex: number, monthIndex: number): EnergyMonth {
  const baseElectricity = 8000 + buildingIndex * 500;
  const baseWater = 1200 + buildingIndex * 100;
  const baseGas = 600 + buildingIndex * 50;
  
  const seasonFactor = monthIndex < 2 ? 0.85 : monthIndex < 4 ? 1.0 : 1.15;
  const randomFactor = 0.9 + (buildingIndex * 0.03 + monthIndex * 0.02) % 0.2;
  
  const electricityBudget = Math.floor(baseElectricity * seasonFactor);
  const waterBudget = Math.floor(baseWater * seasonFactor);
  const gasBudget = Math.floor(baseGas * seasonFactor);
  
  const overBudgetChance = (buildingIndex + monthIndex) % 3 === 0;
  const overFactor = overBudgetChance ? 1.15 + (buildingIndex * 0.05) % 0.15 : 0.85 + (buildingIndex * 0.03) % 0.2;
  
  return {
    month,
    electricity: Math.floor(electricityBudget * overFactor * randomFactor),
    water: Math.floor(waterBudget * overFactor * randomFactor),
    gas: Math.floor(gasBudget * overFactor * randomFactor),
    electricityBudget,
    waterBudget,
    gasBudget
  };
}

const energyStats: EnergyStat[] = buildings.map((building, index) => {
  const buildingMonths: EnergyMonth[] = months.map((month, monthIndex) => 
    generateMonthData(month, index, monthIndex)
  );
  
  const totalElectricity = buildingMonths.reduce((sum, m) => sum + m.electricity, 0);
  const totalWater = buildingMonths.reduce((sum, m) => sum + m.water, 0);
  const totalGas = buildingMonths.reduce((sum, m) => sum + m.gas, 0);
  const totalElectricityBudget = buildingMonths.reduce((sum, m) => sum + m.electricityBudget, 0);
  const totalWaterBudget = buildingMonths.reduce((sum, m) => sum + m.waterBudget, 0);
  const totalGasBudget = buildingMonths.reduce((sum, m) => sum + m.gasBudget, 0);
  
  const overBudgetItems: string[] = [];
  if (totalElectricity > totalElectricityBudget) overBudgetItems.push('electricity');
  if (totalWater > totalWaterBudget) overBudgetItems.push('water');
  if (totalGas > totalGasBudget) overBudgetItems.push('gas');
  
  return {
    id: `ES${building.id}`,
    buildingId: building.id,
    buildingName: building.name,
    months: buildingMonths,
    totalElectricity,
    totalWater,
    totalGas,
    totalElectricityBudget,
    totalWaterBudget,
    totalGasBudget,
    isOverBudget: overBudgetItems.length > 0,
    overBudgetItems
  };
});

export default energyStats;
