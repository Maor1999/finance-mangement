import {prisma} from "../prisma/prisma.js";
const createReport = async(data) =>{
    return prisma.monthlyReport.create({data});
} 

const deleteReport = async(id) =>{
    return prisma.monthlyReport.delete({
        where: {id}
    });
}

const getReport = async(id) =>{
    return prisma.monthlyReport.findUnique({
        where: {id}
    });
}

const updateReport = async(id, data) =>{
    return prisma.monthlyReport.update({
        where: {id},
        data
    })
}

const getReportByUserAndMonth = async(userId, year, month) =>{
    return prisma.monthlyReport.findUnique({
    where: {
    userId_month_year: {
    userId,
    year,
    month,
    }
    }
    });
}

export{
createReport,
deleteReport,
getReport,
updateReport,
getReportByUserAndMonth
};

