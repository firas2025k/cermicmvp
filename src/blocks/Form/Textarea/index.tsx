import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { Textarea as TextAreaComponent } from '@/components/ui/textarea'
import React from 'react'

import { Width } from '../Width'
import { capitaliseFirstLetter } from '@/utilities/capitaliseFirstLetter'
import { FormItem } from '@/components/forms/FormItem'
import { FormError } from '@/components/forms/FormError'
import { nabeaLabelClass, nabeaTextareaClass } from '../fieldStyles'

export const Textarea: React.FC<
  TextField & {
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
    register: UseFormRegister<FieldValues>
    rows?: number
  }
> = ({
  name,
  defaultValue,
  errors,
  label,
  register,
  required: requiredFromProps,
  rows = 6,
  width,
}) => {
  return (
    <Width width={width}>
      <FormItem>
        <Label className={nabeaLabelClass} htmlFor={name}>
          {label}
        </Label>

        <TextAreaComponent
          defaultValue={defaultValue}
          id={name}
          rows={rows}
          className={nabeaTextareaClass}
          {...register(name, {
            required: requiredFromProps
              ? `${capitaliseFirstLetter(label || name)} is required.`
              : undefined,
          })}
        />

        {errors?.[name]?.message && typeof errors?.[name]?.message === 'string' && (
          <FormError message={errors?.[name]?.message} />
        )}
      </FormItem>
    </Width>
  )
}
