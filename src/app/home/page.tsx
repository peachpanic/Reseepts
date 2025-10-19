
import ExpenseList from "@/components/homepage/ExpenseList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function Homepage() {

  // return (
  //   <div className="flex flex-col w-full h-full justify-center items-center bg-teal-600">
  //     <div className="flex flex-col w-full py-8 px-4 mb-4 text-white">
  //       <div className="w-full">Good day, </div>
  //       <div className="font-bold text-2xl">user!</div>

  //       <Card className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 flex flex-col bg-green-200 w-[90%] shadow-lg">
  //         <CardHeader>
  //           <CardTitle>Total Balance</CardTitle>
  //           <h1 className="font-bold text-2xl">P1,234.00</h1>
  //           <CardDescription></CardDescription>
  //         </CardHeader>
  //       </Card>
  //     </div>

  //     <div className="flex flex-col w-full h-full bg-white rounded-t-2xl">
  //       <div className="flex flex-col w-full h-full">
  //         <ExpenseList />
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="flex flex-col w-full h-full bg-teal-600">
      {/* Top Section - with relative positioning and extra padding for card */}
      <div className="relative flex flex-col w-full py-8 px-4 pb-20 text-white">
        <div className="w-full">Good day, </div>
        <div className="font-bold text-2xl">user!</div>
        
        {/* Card positioned absolutely to overlap */}
        {/* absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2  */}
        <Card className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 flex flex-col bg-teal-800 w-[90%] shadow-lg border-0">
          <CardHeader className="text-white">
            <CardTitle>Total Balance</CardTitle>
            <h1 className="font-bold text-2xl">P1,234.00</h1> {/* total balance here */}
            <CardDescription></CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* White Section - with top padding to account for overlapping card */}
      <div className="flex flex-col w-full h-full bg-white rounded-t-2xl pt-16">
        <div className="flex flex-col w-full h-full">
          <ExpenseList />
        </div>
      </div>
    </div>
  );
}
