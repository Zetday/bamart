interface BreadcrumbProps {
  current: "cart" | "checkout" | "payment";
}

export default function CheckoutBreadcrumb({ current }: BreadcrumbProps) {
  const steps = [
    { id: "cart", label: "Cart" },
    { id: "checkout", label: "Checkout" },
    { id: "payment", label: "Payment" },
  ];

  return (
    <ol className="flex items-center w-full max-w-2xl text-center text-sm font-medium text-gray-500 dark:text-gray-400 sm:text-base">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className={`flex items-center ${
            current === step.id ? "text-[#7D1972]" : ""
          }`}
        >
          {step.label}

          {index < steps.length - 1 && (
            <span className="mx-3 text-gray-400">/</span>
          )}
        </li>
      ))}
    </ol>
  );
}
