'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface BreadcrumbProps {
  current: "cart" | "checkout" | "payment";
}

export default function CheckoutBreadcrumb({ current }: BreadcrumbProps) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const steps = [
    { id: "cart", label: "Cart", href: "/cart" },
    { id: "checkout", label: "Checkout", href: "/checkout" },
    { 
      id: "payment", 
      label: "Payment", 
      href: orderId ? `/payment?orderId=${orderId}` : null 
    },
  ];

  return (
    <ol className="flex items-center w-full max-w-2xl text-center text-sm font-medium text-gray-500 dark:text-gray-400 sm:text-base">
      {steps.map((step, index) => {
        const isActive = current === step.id;
        
        return (
          <li
            key={step.id}
            className={`flex items-center ${
              isActive ? "text-[#7D1972] font-bold" : "text-gray-500 hover:text-[#7D1972] dark:hover:text-[#9E1E93] transition-colors"
            }`}
          >
            {step.href && !isActive ? (
              <Link href={step.href}>
                {step.label}
              </Link>
            ) : (
              <span>{step.label}</span>
            )}

            {index < steps.length - 1 && (
              <span className="mx-3 text-gray-400">/</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
