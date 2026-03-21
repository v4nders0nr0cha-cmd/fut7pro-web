import type { FormEvent } from "react";

type ValidatableField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function isValidatableField(target: EventTarget | null): target is ValidatableField {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

function buildPtBrValidationMessage(field: ValidatableField): string {
  const customMessage = field.dataset.validationMessage?.trim();
  if (customMessage) return customMessage;

  const validity = field.validity;

  if (validity.valueMissing) {
    return "Este campo é obrigatório.";
  }

  if (validity.typeMismatch) {
    if (field instanceof HTMLInputElement && field.type === "email") {
      return "Informe um e-mail válido.";
    }
    if (field instanceof HTMLInputElement && field.type === "url") {
      return "Informe uma URL válida.";
    }
    return "Informe um valor válido.";
  }

  if (validity.patternMismatch) {
    return "Preencha no formato esperado.";
  }

  const minLengthAttr = field.getAttribute("minlength");
  const maxLengthAttr = field.getAttribute("maxlength");
  const minLength = minLengthAttr ? Number(minLengthAttr) : 0;
  const maxLength = maxLengthAttr ? Number(maxLengthAttr) : 0;

  if (validity.tooShort && Number.isFinite(minLength) && minLength > 0) {
    return `Use pelo menos ${minLength} caracteres.`;
  }

  if (validity.tooLong && Number.isFinite(maxLength) && maxLength > 0) {
    return `Use no máximo ${maxLength} caracteres.`;
  }

  if (validity.rangeUnderflow || validity.rangeOverflow) {
    const min = field.getAttribute("min");
    const max = field.getAttribute("max");
    if (min && max) {
      return `Informe um valor entre ${min} e ${max}.`;
    }
    if (min) {
      return `Informe um valor maior ou igual a ${min}.`;
    }
    if (max) {
      return `Informe um valor menor ou igual a ${max}.`;
    }
    return "Informe um valor válido.";
  }

  if (validity.stepMismatch) {
    return "Informe um valor válido.";
  }

  return field.validationMessage || "Informe um valor válido.";
}

export function handleFormInvalidPtBr(event: FormEvent<HTMLFormElement>) {
  const target = event.target;
  if (!isValidatableField(target)) return;
  const message = buildPtBrValidationMessage(target);
  target.setCustomValidity(message);
  target.setAttribute("aria-invalid", "true");
}

export function handleFormInputValidationReset(event: FormEvent<HTMLFormElement>) {
  const target = event.target;
  if (!isValidatableField(target)) return;
  target.setCustomValidity("");
  target.setAttribute("aria-invalid", target.validity.valid ? "false" : "true");
}
