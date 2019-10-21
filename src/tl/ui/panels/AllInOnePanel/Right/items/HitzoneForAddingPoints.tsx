import React from 'react'
import css from '$tl/ui/panels/AllInOnePanel/Right/items/HitzoneForAddingPoints.css'
import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import {IColorAccent, IPoint} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {
  ActiveModeContext,
  MODES,
} from '$shared/components/ActiveModeProvider/ActiveModeProvider'
import {PrimitivePropItem} from '$tl/ui/panels/AllInOnePanel/utils'
import {SVG_PADDING_Y} from '$tl/ui/panels/AllInOnePanel/Right/views/SVGWrapper'

const classes = resolveCss(css)

interface IProps {
  colorAccent: IColorAccent
  extremums: [number, number]
  duration: number
  dopeSheet: boolean
  address: PrimitivePropItem['address']
}

interface IState {}

class HitzoneForAddingPoints extends UIComponent<IProps, IState> {
  render() {
    const {colorAccent, dopeSheet} = this.props
    return (
      <ActiveModeContext.Consumer>
        {activeMode => (
          <rect
            {...classes(
              'container',
              dopeSheet && 'fullHeight',
              `${colorAccent.name.toLowerCase()}Cursor`,
              activeMode === MODES.super && 'enabled',
            )}
            fill="transparent"
            width="100%"
            y={dopeSheet ? 0 : -SVG_PADDING_Y / 2}
            onMouseDown={stopPropagation}
            onClick={this.addPoint}
          />
        )}
      </ActiveModeContext.Consumer>
    )
  }

  addPoint = (event: React.MouseEvent<SVGRectElement>) => {
    this._dispatchAddPoint(this._getPointProps(event))
  }

  _getPointProps(event: React.MouseEvent<SVGRectElement>): IPoint {
    const {duration, extremums, dopeSheet} = this.props

    const {clientX, clientY, target} = event
    const {
      left,
      top,
      width,
      height,
    } = (target as SVGRectElement).getBoundingClientRect()

    const time = ((clientX - left + 5) * duration) / width
    let value
    if (dopeSheet) {
      value = 0.5 * (extremums[1] + extremums[0])
    } else {
      value =
        extremums[1] -
        ((clientY - top + 5 - 0.5 * SVG_PADDING_Y) *
          (extremums[1] - extremums[0])) /
          (height - SVG_PADDING_Y)
    }

    return {
      time,
      value,
      interpolationDescriptor: {
        connected: false,
        __descriptorType: 'TimelinePointInterpolationDescriptor',
        interpolationType: 'CubicBezier',
        handles: [0.5, 0, 0.5, 0],
      },
    }
  }

  _dispatchAddPoint(pointProps: IPoint) {
    this.project.reduxStore.dispatch(
      this.project._actions.historic.addPointInBezierCurvesOfScalarValues({
        propAddress: this.props.address,
        pointProps,
        recalculateInterpolator: true,
      }),
    )
  }
}

const stopPropagation = (event: React.MouseEvent<$IntentionalAny>) => {
  event.stopPropagation()
}

export default HitzoneForAddingPoints