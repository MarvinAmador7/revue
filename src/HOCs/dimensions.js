import { Component } from 'react';
import { findDOMNode } from 'react-dom';
import pick from 'lodash/pick';
import isEqual from 'lodash/isEqual';
import compose from 'recompose/compose';
import withState from 'recompose/withState';
import createEagerFactory from 'recompose/createEagerFactory';
import createHelper from 'recompose/createHelper';
import raf from 'raf';
// import shallowEqual from 'recompose/shallowEqual';

const dimensions = (
  sizePropNameArg,
  defaultSize,
) =>
  (BaseComponent) => {
    const factory = createEagerFactory(BaseComponent);
    const sizePropName = sizePropNameArg || '@@__SIZE';
    const sizeSetterPropName = `@@__SET__${sizePropName}`;
    // const pickDependentProps = props => pick(props, props[dependentPropKeysName]);

    return compose(
      withState(sizePropName, sizeSetterPropName, defaultSize || { width: 0, height: 0 }),
    )(
      class extends Component {
        cancelHandler = null;

        componentDidMount() {
          window.addEventListener('resize', this.resizeHandle, false);
          this.resizeHandle();
          // allow to finish draw
          this.cancelHandler = setTimeout(this.resizeHandle, 0);
        }

        componentWillUnmount() {
          window.removeEventListener('resize', this.resizeHandle, false);
          clearTimeout(this.cancelHandler);
        }

        updateDimensions() {
          const node = findDOMNode(this);
          const rect = node.getBoundingClientRect();
          const nextDimensions = pick(rect, Object.keys(defaultSize));
          const prevDimensions = this.props[sizePropName];
          if (!isEqual(prevDimensions, nextDimensions)) {
            this.props[sizeSetterPropName](
              nextDimensions
            );
            return true;
          }
          return false;
        }

        rafUpdateDimensions(c) {
          raf(() => {
            if (this.updateDimensions()) {
              if (c < 10) { // break this cycle if gt
                this.rafUpdateDimensions(c + 1);
              }
            }
          });
        }

        resizeHandle = (evt) => {
          // most people prefer debounce this, I prefer not until performance issues
          const node = findDOMNode(this);
          const rect = node.getBoundingClientRect();
          // returned object is not normal js object - convert
          const nextDimensions = pick(rect, Object.keys(defaultSize));
          const prevDimensions = this.props[sizePropName];

          if (!isEqual(prevDimensions, nextDimensions)) {
            if (evt !== undefined) {
              this.rafUpdateDimensions(0);
            } else {
              this.props[sizeSetterPropName](
                nextDimensions
              );
            }
          }
        }

        render() {
          return factory({ ...this.props });
        }
      }
    );
  };

export default createHelper(dimensions, 'dimensions');
