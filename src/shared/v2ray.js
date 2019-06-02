import Base64 from 'urlsafe-base64'
import { generateID, isNumber, isObject } from './utils'

export function encode (str) {
  return Base64.encode(Buffer.from(str, 'utf-8'))
}

export function decode (str) {
  return Base64.decode(str).toString('utf-8')
}

function merge (v2ray, target) {
  if (isObject(target)) {
    Object.keys(target).forEach(key => {
      if (v2ray[key] !== undefined) {
        v2ray[key] = isNumber(v2ray[key]) ? +target[key] : target[key]
      }
    })
  }
}

export default class Config {
  constructor (config) {
    this.v = '2'
    this.add = '127.0.0.1'
    this.port = 8388
    this.uid = ''
    this.aid = ''
    this.security = 'auto'
    this.net = 'tcp'
    this.type = 'none'
    this.host = ''
    this.path = ''
    this.tls = ''
    this.ps = ''
    this.group = ''
    merge(this, config)
    this.id = generateID()
    this.enable = true
    Object.defineProperty(this, 'remarks_base64', {
      enumerable: true,
      get () {
        return this.ps ? encode(this.ps) : ''
      },
      set () {},
    })
  }

  isValid () {
    return !!(this.add && this.port && this.id && this.aid && this.net && this.type)
  }

  getV2rayLink () {
    const required = {
      v: this.v,
      add: this.add,
      port: this.port,
      id: this.uid,
      aid: this.aid,
      net: this.net,
      type: this.type,
      host: this.host,
      path: this.path,
      tls: this.tls,
      ps: this.ps,
    }
    const link = `vmess://${encode(JSON.stringify(required))}`
    return link
  }

  setV2rayLink (link) {
    if (link) {
      const [valid, config] = isV2rayLinkValid(link)
      if (valid) {
        // for (let key in config) {
        //   this[key] = config[key]
        // }
        this.v = config.v
        this.ps = config.ps
        this.title = config.ps
        this.add = config.add
        this.port = parseInt(config.port)
        this.uid = config.id
        this.aid = config.aid
        this.net = config.net
        this.type = config.type
        this.host = config.host
        this.path = config.path
        this.tls = config.tls
      }
    }
    return this
  }
}

// vmess://xxx 地址是否正确
function isV2rayLinkValid (link) {
  try {
    const body = link.substring(8)
    const config = decode(body)
    return [true, JSON.parse(config)]
  } catch (e) {
    return [false]
  }
}

/**
 * 判断链接是否是可用的 v2ray 地址
 * @param {String} link 要判断的链接
 */
export function isLinkValid (link) {
  if (/^vmess:\/\//.test(link)) {
    return isV2rayLinkValid(link)
  }
  return [false]
}

// 根据字符串导入配置，字符串使用\n或空格间隔
export function loadConfigsFromString (strings) {
  if (strings) {
    const arr = strings.split(/[\n ]/)
    const avaliable = []
    arr.forEach(str => {
      if (/^vmess:\/\//.test(str)) {
        if (isV2rayLinkValid(str)[0]) {
          avaliable.push(new Config().setV2rayLink(str))
        }
      }
    })
    if (avaliable.length) {
      return avaliable
    }
  }
  return []
}
