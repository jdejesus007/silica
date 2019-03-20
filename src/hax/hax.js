goog.module('hax')

const Safari = goog.require('hax.safari')

const reduce = Function.bind.call(Function.call, Array.prototype.reduce)
const isEnumerable = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable)
const concat = Function.bind.call(Function.call, Array.prototype.concat)
const keys = Reflect.ownKeys

exports.init = function () {
  if (!Object.values) {
    Object.values = function values (O) {
      return reduce(keys(O), (v, k) => concat(v, typeof k === 'string' && isEnumerable(O, k) ? [O[k]] : []), [])
    }
  }

  if (!Object.entries) {
    Object.entries = function entries (O) {
      return reduce(keys(O), (e, k) => concat(e, typeof k === 'string' && isEnumerable(O, k) ? [[k, O[k]]] : []), [])
    }
  }

  if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
      value: function (searchElement, fromIndex) {
        if (this == null) {
          throw new TypeError('"this" is null or not defined')
        }

        // 1. Let O be ? ToObject(this value).
        var o = Object(this)

        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0

        // 3. If len is 0, return false.
        if (len === 0) {
          return false
        }

        // 4. Let n be ? ToInteger(fromIndex).
        //    (If fromIndex is undefined, this step produces the value 0.)
        var n = fromIndex | 0

        // 5. If n ≥ 0, then
        //  a. Let k be n.
        // 6. Else n < 0,
        //  a. Let k be len + n.
        //  b. If k < 0, let k be 0.
        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0)

        function sameValueZero (x, y) {
          return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y))
        }

        // 7. Repeat, while k < len
        while (k < len) {
          // a. Let elementK be the result of ? Get(O, ! ToString(k)).
          // b. If SameValueZero(searchElement, elementK) is true, return true.
          if (sameValueZero(o[k], searchElement)) {
            return true
          }
          // c. Increase k by 1.
          k++
        }

        // 8. Return false
        return false
      }
    })
  }
}

exports.getDatasetProperty = Safari.getDatasetProperty
exports.hasDatasetProperty = Safari.hasDatasetProperty
