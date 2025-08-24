"use client";
import { Switch } from "@headlessui/react";
import { type FC } from "react";

interface ToggleProps {
  visivel: boolean;
  onChange: (value: boolean) => void;
}

const ToggleVisibilidade: FC<ToggleProps> = ({ visivel, onChange }) => {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-base font-semibold">
        Prestação visível para atletas?
      </span>
      <Switch
        checked={visivel}
        onChange={onChange}
        className={`${
          visivel ? "bg-yellow-400" : "bg-gray-300"
        } relative inline-flex h-6 w-11 items-center rounded-full transition`}
      >
        <span
          className={`${
            visivel ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
        />
      </Switch>
      <span className="ml-2 text-xs text-gray-500">
        {visivel ? "Visível" : "Somente admin"}
      </span>
    </div>
  );
};

export default ToggleVisibilidade;
