import { createContext, useContext, useState } from 'react';

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
    const [expenses, setExpenses] = useState([]);

    const addExpense = (expense) => {
        setExpenses((prev) => [expense, ...prev]);
    };

    return (
        <ExpenseContext.Provider value={{ expenses, addExpense }}>
            {children}
        </ExpenseContext.Provider>
    );
}

export const useExpenses = () => useContext(ExpenseContext);
