"use client";

import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

export type DropDownProps = {
  opcoes: string[];
  value?: string;                            // <-- sem null
  onChange?: (v: string | undefined) => void; // <-- permite limpar (undefined)
  placeholder?: string;
  className?: string;
};

export default function DropDown({
  opcoes,
  value, // se não vier, ficará undefined
  onChange,
  placeholder = "Código do cargo",
  className,
}: DropDownProps) {
  // use undefined para representar "sem seleção"
  const [selecionado, setSelecionado] = useState<string | undefined>(value);

  const handleChange = (v: string) => {
    setSelecionado(v);
    onChange?.(v);
  };

  return (
    <div className={["w-full flex justify-center", className].filter(Boolean).join(" ")}>
      <Listbox value={selecionado} onChange={handleChange}>
        <div className="relative w-full max-w-xs">
          {/* Botão que exibe o valor atual */}
          <Listbox.Button className="bg-gray-700 text-white rounded-2xl p-3 w-full text-left">
            {selecionado ?? placeholder}
          </Listbox.Button>

          {/* Painel de opções (dropdown) */}
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="
                absolute z-50 mt-2 w-full rounded-xl bg-gray-800 text-white shadow-lg
                ring-1 ring-black/10 focus:outline-none
                max-h-60 overflow-y-auto
              "
            >
              {opcoes.map((opt) => (
                <Listbox.Option
                  key={opt}
                  value={opt}
                  className={({ active, selected }) =>
                    [
                      "cursor-pointer select-none px-3 py-2",
                      active ? "bg-gray-700" : "",
                      selected ? "font-semibold" : "font-normal",
                    ].join(" ")
                  }
                >
                  {opt}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}