"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Controller, FormProvider, useFormContext, useFormState } from "react-hook-form"
import type * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

const FormField = ({ ...props }: React.ComponentProps<typeof Controller>) => {
  return <Controller {...props} />
}

const FormItemContext = React.createContext<{ id: string } | null>(null)

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId()

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    )
  },
)
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return <Label ref={ref} className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    const { getFieldState } = useFormContext()
    const { error } = useFormState()
    const fieldContext = React.useContext(FormItemContext)

    const formItemId = `${fieldContext?.id}-form-item`
    const formDescriptionId = `${fieldContext?.id}-form-item-description`
    const formMessageId = `${fieldContext?.id}-form-item-message`

    if (!fieldContext) {
      throw new Error("useFormField should be used within <FormField>")
    }

    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={!formDescriptionId ? undefined : `${formDescriptionId} ${formMessageId}`}
        aria-invalid={!!error}
        {...props}
      />
    )
  },
)
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField()

    return (
      <p ref={ref} id={formDescriptionId} className={cn("text-[0.8rem] text-muted-foreground", className)} {...props} />
    )
  },
)
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message) : children

    if (!body) {
      return null
    }

    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn("text-[0.8rem] font-medium text-destructive", className)}
        {...props}
      >
        {body}
      </p>
    )
  },
)
FormMessage.displayName = "FormMessage"

function useFormField() {
  const fieldContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()

  const fieldState = getFieldState(fieldContext?.name!, fieldContext)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  return {
    id: fieldContext.id,
    name: fieldContext.name,
    formItemId: `${fieldContext.id}-form-item`,
    formDescriptionId: `${fieldContext.id}-form-item-description`,
    formMessageId: `${fieldContext.id}-form-item-message`,
    ...fieldState,
  }
}

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField }
