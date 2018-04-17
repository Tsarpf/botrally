import React from 'react'

const StreamComponent = (dataSource) => {
  if (!isBacon(dataSource)) {
    return recurseElements(dataSource)
  }

  return class extends React.Component {
    constructor(props) {
      super(props)
      this.state = { data: () => <div> </div> }
      this.onChange = this.onChange.bind(this)
      this.dispose = null
    }

    componentDidMount() {
      this.dispose = dataSource.onValue(this.onChange)
    }

    componentWillUnmount() {
      if (this.dispose) this.dispose()
    }

    onChange(value) {
      const resultElem = recurseElements(value)
      this.setState({ data: () => resultElem })
    }

    render() {
      const Component = this.state.data
      return <Component {...this.props} />
    }
  }
}
function isBacon(obj) {
  if (obj.desc && obj.dispatcher && obj.id)
    return true
  return false
}
function recurseElements(obj) {
  if (isBacon(obj)) {
    const WrappedBacon = StreamComponent(obj)
    return <WrappedBacon key={obj.id} />
  }
  if (!obj.props || !obj.props.children || typeof obj.props.children === 'string') {
    return obj
  }
  function recurseInner(inner) {
    if (inner.props && inner.props.children) {
      const result = recurseElements(inner.props.children)
      const newInner = React.cloneElement(inner, null, result)
      return newInner
    }
    return recurseElements(inner)
  }

  // Lone children are not in an array in React :)
  const newChildren = obj.props.children.length
    ? obj.props.children.map(inner => recurseInner(inner))
    : recurseInner(obj.props.children)

  const newObj = React.cloneElement(obj, null, newChildren)
  return newObj
}

export default StreamComponent