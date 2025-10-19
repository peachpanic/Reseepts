import { QueryClient } from "@tanstack/react-query";
import { Transaction } from "@/lib/definitions";

// sample expense from ocr

// {
//   "user_id": 123,
//   "amount": 29.82,
//   "category": "Food",
//   "description": "Grocery Depot",
//   "payment_method": "other",
//   "expense_date": "2019-01-07",
//   "created_at": "2024-10-27T10:00:00Z",
//   "line_items": [
//     {
//       "item_name": "DELITE SKIM",
//       "category": "Food",
//       "quantity": 4,
//       "unit_price": 2.59,
//       "total_price": 10.36
//     },
//     {
//       "item_name": "WHOLEMILK",
//       "category": "Food",
//       "quantity": 3,
//       "unit_price": 2.59, 
//       "total_price": 7.77
//     },
//     {
//       "item_name": "REDBULL",
//       "category": "Food",
//       "quantity": 1,
//       "unit_price": 1.89,
//       "total_price": 1.89
//     },
//     {
//       "item_name": "STRING CHEESE 16PK",
//       "category": "Food",
//       "quantity": 2,
//       "unit_price": 3.99,
//       "total_price": 7.98
//     }
//   ]
// }

// export default function useOCRData() {
//     const queryClient = new QueryClient();


    