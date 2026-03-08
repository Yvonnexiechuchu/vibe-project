export interface Summary {
  total_income: number;
  total_expenses: number;
  net: number;
  adjusted_expenses: number;
  adjusted_net: number;
  transaction_count: number;
  date_range_start: string;
  date_range_end: string;
  data_source: string;
  persona: string;
}

export interface Transaction {
  "Transaction Date": string;
  merchant_normalized: string;
  "Transaction Amount": number;
  Category: string;
  "Report Category": string;
  payment_normalized: string;
  is_outlier: boolean;
  is_refund_pair: boolean;
  is_shared: boolean;
  personal_cost: number;
  net_amount: number;
}

export interface CategoryData {
  Category?: string;
  "Report Category"?: string;
  Total: number;
  Count: number;
}

export interface Categories {
  by_category: CategoryData[];
  by_report_category: CategoryData[];
}

export interface MerchantData {
  Merchant: string;
  Total: number;
  Count: number;
}

export interface TrendData {
  Period: string;
  Total: number;
  "Change ($)": number | null;
  "Change (%)": number | null;
}

export interface TrendCategoryData {
  Period: string;
  Category: string;
  Total: number;
}

export interface Trends {
  overall: TrendData[];
  by_category: TrendCategoryData[];
}

export interface RecurringData {
  Merchant: string;
  Months: number;
  Total: number;
  Count: number;
  "Monthly Avg": number;
}

export interface IncomeData {
  Source: string;
  Total: number;
  Count: number;
}

export interface SharedData {
  "Transaction Date": string;
  merchant_normalized: string;
  "Merchant Name": string;
  "Transaction Amount": number;
  personal_cost: number;
}

export interface NewSpendingData {
  merchant_normalized: string;
  "Transaction Amount": number;
  "Transaction Date": string;
  "Report Category": string;
}

export interface PaymentMethodData {
  "Payment Method": string;
  Total: number;
}

export interface OutlierData {
  "Transaction Date": string;
  merchant_normalized: string;
  "Transaction Amount": number;
  Category: string;
  "Report Category": string;
}

export interface CleaningSummary {
  merchant_normalizations: string[];
  payment_normalizations: string[];
  category_corrections: string[];
  report_category_corrections: string[];
  refund_pairs: string[];
  shared_expenses: string[];
  outliers_flagged: number;
  outlier_details: string[];
  total_actions: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

export interface DashboardProps {
  summary: Summary;
  transactions: Transaction[];
  categories: Categories;
  merchants: MerchantData[];
  trends: Trends;
  recurring: RecurringData[];
  income: IncomeData[];
  shared: SharedData[];
  paymentMethods: PaymentMethodData[];
  outliers: OutlierData[];
  cleaning: CleaningSummary;
}
