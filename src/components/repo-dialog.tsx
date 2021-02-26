import * as echarts from 'echarts'
import React, { useCallback, useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

import { useEchartsOptions } from '../utils/echarts-data'
import { parseDate } from '../utils/time'

interface IDialogProps {
  repoData
}

function RepoDialog({ repoData }: IDialogProps) {
  const echartsChart = useRef<HTMLDivElement>(null)
  const [inViewRef, inView] = useInView()
  const echartsOptions = useEchartsOptions(repoData)

  const setRefs = useCallback(
    (node) => {
      // @ts-ignore
      echartsChart.current = node
      inViewRef(node)
    },
    [echartsChart, inViewRef]
  )

  useEffect(() => {
    const current = echartsChart.current
    if (!current || !echartsOptions || !inView) return
    console.log('show', inView, JSON.stringify(echartsOptions))
    echarts.dispose(current)
    const chart = echarts.init(current, {
      renderer: 'svg'
    })
    chart.setOption(echartsOptions)
  }, [echartsChart, echartsOptions, inView])

  return (
    <details-dialog
      class="notifications-component-dialog dashboard-settings-menu"
      data-target="notifications-list-subscription-form.customDialog"
      hidden
      role="dialog"
      style={{
        width: 500,
        maxHeight: 'none'
      }}
    >
      <div className="SelectMenu-modal notifications-component-dialog-modal overflow-visible">
        <header className="d-none d-sm-flex flex-items-start pt-1">
          <button
            className="border-0 px-2 pt-1 m-0 link-gray f5"
            style={{ backgroundColor: 'transparent' }}
            data-action="click:notifications-list-subscription-form#closeCustomDialog"
            aria-label="Return to menu"
            type="button"
          >
            <svg
              style={{ position: 'relative', left: 2, top: 1 }}
              className="octicon octicon-arrow-left"
              height="16"
              viewBox="0 0 16 16"
              version="1.1"
              width="16"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h7.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06z"
              />
            </svg>
          </button>
          <h1 className="pt-1 pr-4 pb-0 pl-0 f5 text-bold">Oak Board</h1>
        </header>
        <fieldset
          style={{
            width: '100%',
            overflow: 'hidden'
          }}
        >
          <legend>
            <div className="text-small text-gray pt-0 pr-3 pb-3 pl-6 pl-sm-5 border-bottom mb-3">
              Display the data analysis chart in this repository (Last data
              update time {parseDate(repoData?.updateAt || 0)}).
            </div>
          </legend>
          <div
            ref={setRefs}
            style={{
              minHeight: 360,
              width: 500,
              marginBottom: 5
            }}
          />
        </fieldset>
      </div>
    </details-dialog>
  )
}

export default RepoDialog
