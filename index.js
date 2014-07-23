var remove   = require('remove-element')
  , escape   = require('escape-html')
  , css      = require('insert-css')
  , inherits = require('inherits')
  , domify   = require('domify')
  , Emitter  = require('events').EventEmitter

var fs       = require('fs')
var style  = fs.readFileSync(__dirname + '/sidebar.css', 'utf8')
var markup = fs.readFileSync(__dirname + '/sidebar.html', 'utf8')

module.exports = BrowserWorkshopperSidebar

inherits(BrowserWorkshopperSidebar, Emitter)
function BrowserWorkshopperSidebar() {
  if (!(this instanceof BrowserWorkshopperSidebar)) {
    return new BrowserWorkshopperSidebar()
  }

  Emitter.call(this)

  this._enabled = false
  this._statusColor = null
  this._status = ''
  this._amount = 1

  this.el = document.body.appendChild(domify(markup))
  this.content  = this.el.querySelector('.bw-sidebar-content')
  this.statusMsgEl  = null

  if (style) css(style)
  style = null

  var status = this.el.querySelector('.bw-sidebar-status')
    , range  = this.el.querySelector('.bw-sidebar-amount')
    , hide   = this.el.querySelector('.bw-sidebar-hide')
    , test   = this.el.querySelector('.bw-sidebar-test')
    , self   = this

  this.elTest   = test
  this.elStatus = status

  hide.addEventListener('click', function(e) {
    self.enabled = !self.enabled
  }, false)

  test.addEventListener('click', function(e) {
    self.emit('test')
  }, false)

  // Prevents a weird quirk in chrome where the sidebar would
  // transition its transform property from translate(0) to
  // translate(-100%) on page load.
  setTimeout(function() {
    self.el.classList.remove('preloading')
  }, 50)
}

BrowserWorkshopperSidebar.prototype.pass = function (msg) {
  this.status = msg
  this.elStatus.classList.remove('failed')
  this.elStatus.classList.add('passed')
}
BrowserWorkshopperSidebar.prototype.fail = function (msg) {
  this.status = msg
  this.elStatus.classList.remove('passed')
  this.elStatus.classList.add('failed')
}

Object.defineProperty(BrowserWorkshopperSidebar.prototype, 'enabled', {
  get: function() { return this._enabled },
  set: function(value) {
    if ((value = !!value) === this._enabled) return
    if (this._enabled = value) {
      this.el.classList.add('enabled')
    } else {
      this.el.classList.remove('enabled')
    }
  }
})

Object.defineProperty(BrowserWorkshopperSidebar.prototype, 'status', {
  get: function() { return this._status },
  set: function(value) {
    this._status = value = value ? String(value) : ''

    if (this.statusMsgEl) {
      var prev = this.statusMsgEl
      this.statusMsgEl.style.top = '-50%'
      this.statusMsgEl.style.opacity = 0
      this.statusMsgEl = null

      setTimeout(function() {
        remove(prev)
      }, 500)
    }

    if (!value) return

    var msg = this.statusMsgEl = document.createElement('div')
    msg.innerHTML = escape(value)
    msg.classList.add('bw-sidebar-message')
    msg.classList.add('adding')
    this.elStatus.appendChild(msg)

    setTimeout(function() {
      msg.classList.remove('adding')
    })
  }
})

Object.defineProperty(BrowserWorkshopperSidebar.prototype, 'statusColor', {
  get: function() { return this._statusColor },
  set: function(value) {
    this._statusColor = value = value ? String(value) : null
    this.elStatus.style.backgroundColor = value
  }
})
