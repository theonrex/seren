import type { NextPage } from "next";
import CreateAccount from "@/components/merchant/CreateAccount";

// Component to create payment account
const CreatePaymentAccount = () => {
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-black text-white rounded shadow">
      <CreateAccount />
    </div>
  );
};

// Main Page Component
const PaymentSetup: NextPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <main>
          <h1 className="text-2xl font-bold mb-6 text-center">
            Payment Account Setup
          </h1>
          <CreatePaymentAccount />
        </main>
      </div>
    </div>
  );
};

// For server-side handling
export async function getServerSideProps() {
  // You can do server-side initialization here if needed
  return {
    props: {},
  };
}

export default PaymentSetup;
