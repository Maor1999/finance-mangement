const toCents = (moneyStr) => {
    const str = String(moneyStr);
    const sign = str.startsWith("-") ? -1 : 1;
    const abs = str.replace("-", "");
    const [whole, frac = ""] = abs.split(".");
    return sign * (Number(whole) * 100 + Number(frac.padEnd(2, "0")));
};

const fromCents = (cents) => {
    const sign = cents < 0 ? "-" : "";
    const abs = Math.abs(cents);
    return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
};

const calculateMonthlyReport = ({
    salaryTotal,
    expenseTotal,
    byCategory,
    year,
    month
}) => {
    const salaryCents = toCents(salaryTotal);
    const expenseCents = toCents(expenseTotal);
    const netCents = salaryCents - expenseCents;

    return({
        year,
        month,
        salaryTotal,
        expenseTotal,
        net: fromCents(netCents),
        byCategory
    })
}
export {calculateMonthlyReport};
