
const mock = [{
    "basicSalary": "20500000",
    "insuranceSalary": "18500000",
    "salaryType": "NET",
    "netSalary": "20500000",
    "grossSalary": "23500000",

    "hasSocialInsurance": true,
    "socialInsuranceRate": "8",

    "hasHealthInsurance": true,
    "healthInsuranceRate": "1.5",

    "hasUnemploymentInsurance": true,
    "unemploymentInsuranceRate": "1",

    "hasUnionFee": true,
    "unionFee": "185000",

    "hasHealthCareInsurance": true,
    "healthCareInsuranceCompany": "PVI Care",
    "healthCareInsuranceBenefit": "500000000",
    "healthCareInsuranceRate": "0",

    "responsibilityAllowance": "2000000",
    "positionAllowance": "1000000",
    "hazardAllowance": "500000",
    "mealAllowance": "730000",
    "mealAllowanceUnit": "MONTH",
    "fuelAllowance": "500000",
    "phoneAllowance": "200000",
    "businessTripAllowance": "0",
    "otherAllowance": "100000",

    "leaveQuotaIds": ["ANNUAL_LEAVE_2026", "SICK_LEAVE_2026"],

    "hasPersonalIncomeTax": true,
    "personalIncomeTaxRate": "10",
    "hasFamilyDeduction": true,
    "dependentsCount": "1"
}]
const CardInfo = ({ icon, title, total, items }) => {
    return (
        <div>
            <div className="flex justify-between items-center bg-[#F4F4F5] rounded-t-xl p-3">
                <span className="flex items-center gap-3">{icon}<span>{title}</span></span>
                <span>{total}</span>
            </div>
            <div className="py-3 px-6 bg-white grid grid-cols-3 gap-4">
                {items?.map(it =>
                    <div key={it.key} className="grid grid-cols-3">
                        <div>
                            <div>{it.label}</div>
                            <div>{it.value}</div>
                        </div>
                        <div>
                            <div>{it.formula}</div>
                            <div>{it.formulaValue}</div>
                        </div>
                        <div>
                            <div>{it.totalAmount}</div>
                        </div>
                    </div>)}
            </div>
        </div>
    )
}

const PayrollDetailsDrawer = () => {
    // return <div>{mock.map(it => <CardInfo key={it.basicSalary} icon={ } />)}</div>;
    return <div>PayrollDetailsDrawer</div>;
};

export default PayrollDetailsDrawer;