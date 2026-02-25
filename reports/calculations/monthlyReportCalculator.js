const calculateMonthlyReport = ({
    salaryTotal,
    expenseTotal,
    byCategory,
    year,
    month
}) =>{
    const net = Number(salaryTotal) - Number(expenseTotal);

    return({
        year,
        month,
        salaryTotal,
        expenseTotal,
        net: net.toFixed(2),
        byCategory
    })
}
export {calculateMonthlyReport};
