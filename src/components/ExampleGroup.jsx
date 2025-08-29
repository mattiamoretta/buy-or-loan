import { Disclosure } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

export default function ExampleGroup({ title, children }) {
  return (
    <Disclosure>
      {({ open }) => (
        <div className="border rounded-xl bg-white shadow">
          <Disclosure.Button className="flex w-full items-center justify-between px-4 py-3 text-lg font-medium text-left">
            <span>{title}</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </Disclosure.Button>
          <Disclosure.Panel className="px-4 pb-4">
            {children}
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
}
