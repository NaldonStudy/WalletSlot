import React from "react";
import { View } from "react-native";
import type { SlotTransaction } from "@/src/types/slot";
import TransactionItem from "./transactionItem";

interface Props {
  transactions: SlotTransaction[];
}

const TransactionList = ({ transactions }: Props) => {
  return (
    <View>
      {transactions.map((transaction) => (
        <TransactionItem 
          key={transaction.transactionId} 
          transaction={transaction} 
        />
      ))}
    </View>
  );
};

export default TransactionList;
