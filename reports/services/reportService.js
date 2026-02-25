import {
createReport,
updateReport,
getReportByUserAndMonth}
from "../dataAccessDb/reportData.js";

import {fetchMonthlySummaryFromFinance}
from "../integrations/financeIntegration.js";

import {calculateMonthlyReport}
from "../calculations/monthlyReportCalculator.js"

const userReport = async(userId, year, month, token) =>{
    const summary = await fetchMonthlySummaryFromFinance(token, year, month);
    const {salaryTotal, expenseTotal, byCategory} = summary;
    const calculatedReport = calculateMonthlyReport({
        salaryTotal,
        expenseTotal,
        byCategory,
        year,
        month
    });
    const reportData = {
        userId,
        year: calculatedReport.year,
        month: calculatedReport.month,
        salaryTotal: calculatedReport.salaryTotal,
        expenseTotal: calculatedReport.expenseTotal,
        net: calculatedReport.net,
    };
    const existingReport = await getReportByUserAndMonth(userId, year, month);
    if(!existingReport){
        const saveReport = await createReport(reportData);
        return { ...saveReport, byCategory };
    }
    else{
        const updatedReport = await updateReport(existingReport.id,
            reportData
        )
        return { ...updatedReport, byCategory };
    }
}
export {userReport};
