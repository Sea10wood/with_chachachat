'use client'

import React from 'react'

export function ComponentWrapper({
  componentName,
  zIndex,
  children,
}: {
  componentName: string
  zIndex: number
  children: React.ReactNode
}) {
  return (
    <div
      data-component-name={componentName}
      data-zindex={zIndex}
      style={{ zIndex }}
    >
      {children}
    </div>
  )
} 