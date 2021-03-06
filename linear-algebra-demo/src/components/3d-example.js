import React from 'react'
import { withTheme } from 'styled-components'
import * as THREE from 'three'

import {
  getGetAnimatedColor,
  getGetAnimatedTransformation
} from '../utils/animations'
import { toMatrix4, fromMatrix4 } from '../utils/three'
import Container from './example-container'
import InfoContainer from './info-container'
import ThreeContainer from './three-container'

const PERIOD = 5000

class View3D extends React.Component {
  render() {
    return null
  }
  componentDidMount() {
    const { matrix, theme, scene } = this.props

    const axes = new THREE.AxesHelper(4)
    const initialColor = theme.color.red
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    this.segments = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: theme.color.mainText })
    )
    this.cube = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: initialColor })
    )
    this.objects = [this.cube, this.segments]
    this.objects.forEach(obj => (obj.matrixAutoUpdate = false))
    scene.add(this.cube, axes, this.segments)

    this.getAnimatedColor = getGetAnimatedColor(
      initialColor,
      theme.color.blue,
      PERIOD
    )
    const fromMatrix = fromMatrix4(this.cube.matrix)
    const toMatrix = matrix.toDimension(4)
    this.getAnimatedTransformation = getGetAnimatedTransformation(
      fromMatrix,
      toMatrix,
      PERIOD
    )
    this.frameId = requestAnimationFrame(this.animate)
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.frameId)
  }

  animate = () => {
    const { scene, camera, renderer } = this.props
    const transformation = this.getAnimatedTransformation()
    const matrix4 = toMatrix4(transformation)
    this.cube.material.color.set(this.getAnimatedColor())
    this.objects.forEach(obj => obj.matrix.set(...matrix4.toArray()))
    renderer.render(scene, camera)
    this.frameId = window.requestAnimationFrame(this.animate)
  }
}

const Example3D = ({ matrix, renderInformation, theme }) => {
  const Information = () => {
    if (renderInformation) {
      return renderInformation({ transformedColor: theme.color.blue })
    }
    return null
  }
  const renderView = props => {
    const completeProps = { ...props, matrix, theme }
    return <View3D {...completeProps} />
  }
  return (
    <Container>
      <ThreeContainer renderView={renderView} />
      <InfoContainer>
        <Information />
      </InfoContainer>
    </Container>
  )
}

export default withTheme(Example3D)
