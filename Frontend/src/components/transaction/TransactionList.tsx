import React from "react";
import { FlatList } from "react-native";
import type { SlotTransaction } from "@/src/types/slot";
import TransactionItem from "./transactionItem";

interface Props {
  transactions: SlotTransaction[];
}

const TransactionList = ({ transactions }: Props) => {
  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.transactionId}
      renderItem={({ item }) => <TransactionItem transaction={item} />}
    />
  );
};

export default TransactionList;
