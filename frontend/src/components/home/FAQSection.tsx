import { motion, Variants } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const FAQ = [
  {
    value: "item-1",
    trigger: "What is the first step in buying a home?",
    content:
      "Start by getting pre-approved for a mortgage to know your budget.",
  },
  {
    value: "item-2",
    trigger: "How much should I save for a down payment?",
    content:
      "Typically, you'll need 5-20% of the home's price for the down payment.",
  },
  {
    value: "item-3",
    trigger: "What is a seller's market?",
    content:
      "In a seller's market, demand exceeds supply, often leading to higher prices.",
  },
  {
    value: "item-4",
    trigger: "How long does it take to close on a house?",
    content:
      "On average, it takes 30-45 days from offer acceptance to closing.",
  },
  {
    value: "item-5",
    trigger: "What is a home inspection?",
    content:
      "A home inspection assesses the property's condition before purchase.",
  },
  {
    value: "item-6",
    trigger: "How do I determine my home’s value?",
    content:
      "A real estate agent or appraiser can help estimate your home's market value.",
  },
  {
    value: "item-7",
    trigger: "Should I rent or buy a home?",
    content:
      "It depends on your financial situation, lifestyle, and long-term plans.",
  },
  {
    value: "item-8",
    trigger: "What is an HOA?",
    content:
      "A Homeowners Association manages shared spaces and may have rules for residents.",
  },
];

const FAQSection: React.FC = () => {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center px-4 md:mx-auto md:px-6 lg:px-12"
        >
          <div className="mb-6 flex w-fit items-center gap-2 rounded-full bg-[#f2f7ff] px-4 py-2">
            <span className="text-base font-medium text-[#06B6D4]">FAQ</span>
          </div>

          <h1 className="max-w-4xl text-center text-4xl tracking-tighter text-gray-900 md:text-5xl">
            Your questions, <span>Answered</span>
          </h1>
        </motion.div>
        <div className="px- mt-5 px-2 md:mt-10">
          <Accordion type="single" collapsible>
            {FAQ.map((faq, id) => (
              <AccordionItem value={faq.value} key={id}>
                <AccordionTrigger className="text-left text-lg md:text-2xl">
                  {faq.trigger}
                </AccordionTrigger>
                <AccordionContent className="text-lg text-[#808080] md:text-2xl">
                  {faq.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
