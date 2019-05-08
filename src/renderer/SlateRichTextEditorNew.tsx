import { Editor } from 'slate-react'
import { Value, Block, Document, Selection } from 'slate'
import { LinkPlugin, LinkButton } from '@slate-editor/link-plugin'

import * as React from 'react'
const initialValue = require('../store/value.json') // TODO: pre-load Joel's outline

import console = require("console");
console.log("initial value is" + initialValue)
import { isKeyHotkey } from 'is-hotkey'

const DEFAULT_NODE = 'paragraph'

const isBoldHotkey = isKeyHotkey('mod+b') // Mac users shall press cmd + b
const isItalicHotkey = isKeyHotkey('mod+i')
const isUnderlinedHotkey = isKeyHotkey('mod+u')
const isCodeHotkey = isKeyHotkey('mod+`')
const isRecontextualize = isKeyHotkey('mod+r')

import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdLooksOne,
  MdLooksTwo,
  MdLooks3,
  MdFormatListNumbered,
  MdFormatListBulleted,
  MdSave,
  MdFormatQuote,
  MdCode,
  MdNoteAdd,
  MdDeleteForever,
  MdSettings,
  MdArrowUpward,
  MdFindInPage
} from "react-icons/md"; ////http://react-icons.github.io/react-icons/md.html

const button_dict = {
  "format_bold": MdFormatBold
}

// const plugins = [LinkPlugin()]
/**
 * The rich text example. from https://github.com/ianstormtaylor/slate/tree/master/examples/rich-text
 *
 * @type {Component}
 */

import styled from '@emotion/styled'

export const Button = styled('span')`
  cursor: pointer;
  color: ${props =>
    props.reversed
      ? props.active
        ? 'white'
        : '#aaa'
      : props.active
        ? 'black'
        : '#ccc'};
`

type SlateTypes =
  | "bold"
  | "italic"
  | "code"
  | "underlined"
  | "ordered-list"
  | "unordered-list"
  | "list-item-child"
  | "list-item"
  | "paragraph"
  | "heading-one"
  | "heading-two"
  | "heading-three"
  | "block-quote"
  | "bulleted-list"
  | "numbered-list"
  | "recontextualize_hook"

export const Icon = styled(({ className, ...rest }) => {
  return <span className={`material-icons ${className}`} {...rest} />
})`
  font-size: 30px;
  vertical-align: text-bottom;
`

export const Menu = styled('div')`
  & > * {
    display: inline-block;
  }
  & > * + * {
    margin-left: 15px;
  }
`

export const Toolbar = styled(Menu)`
  position: relative;
  padding: 1px 18px 17px;
  margin: 0 -20px;
  border-bottom: 2px solid #eee;
  margin-bottom: 20px;
`

export const IconContainer = styled('div')`
  white-space:nowrap;
  `
export const IconDiv = styled('div')`
  display: inline-block;
  `
export const IconSidenote = styled('div')`
  display: inline-block;
    `


export class SlateRichTextEditor extends React.Component<any, any>{

  timeout: number = 0
  // RECONTEXTUALIZE_HOOK_ICON = 'find_in_page'
  state = {
    value: Value.fromJSON(initialValue),
  }

  /**
 * Check if the current selection has a mark with `type` in it.
 *
 * @param {String} type
 * @return {Boolean}
 */

  hasMark = type => {
    const { value } = this.state
    // console.log(type)
    return value.activeMarks.some(mark => mark.type === type)
  }

  /**
 * Check if the any of the currently selected blocks are of `type`.
 *
 * @param {String} type
 * @return {Boolean}
 */

  hasBlock = type => {
    const { value } = this.state
    return value.blocks.some(node => node.type === type)
  }

  editor: Editor;
  ref = editor => {
    this.editor = editor;
  };


  onClickMark = (event, type) => {
    if (type === 'recontextualize_hook') {
      console.log('inside recontexutalize_hook')
      this.editor.insertText('[x]')
      return
    }

    // console.log('Inside onClickMark')

    event.preventDefault()
    this.editor.toggleMark(type)
  }

  renderMarkButton = (type: SlateTypes, icon: React.ReactNode) => {
    const isActive = this.hasMark(type)
    let sidenote: any
    sidenote = <div />
    if (type.toString() === "recontextualize_hook") {
      sidenote = <div>cmd+r</div> // />'cmd+r'
    }

    // TODO: onClickMark for recontext hook
    return (
      <Button
        active={isActive}
        onMouseDown={event => this.onClickMark(event, type)}
      >
        <IconContainer>
          <IconDiv><Icon>{icon}</Icon></IconDiv>
          <IconSidenote>{sidenote}</IconSidenote>
        </IconContainer>
      </Button>
    )
  }

  renderBlockButton = (type: SlateTypes, icon: React.ReactNode) => {
    let isActive = this.hasBlock(type)

    if (['numbered-list', 'bulleted-list'].includes(type)) {
      const {
        value: { document, blocks },
      } = this.state

      if (blocks.size > 0) {
        const parent = document.getParent(blocks.first().key)
        isActive = this.hasBlock('list-item') && parent != null && (parent.type === type)
      }
    }

    return (
      <Button
        active={isActive}
        onMouseDown={event => this.onClickBlock(event, type)}
      >
        <Icon>{icon}</Icon>
      </Button>
    )
  }


  iconProps = {
    size: "25px",
    style: { verticalAlign: "middle" }
  };

  /**
 * On change, save the new `value`.
 * (from Xin) This falls apart, however, because the user can usually type faster your server can respond.
 *
 * @param {Editor} editor
 *
 * mismatch between "editor" and "value" concepts  https://github.com/ianstormtaylor/slate/issues/2206
 */

  onChange = ({ value }) => {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      // console.log('500 seconds, updated')
      this.props.onUpdate(value, 1)
    }, 800)

    this.setState({ value })
  }

  onKeyDown = (event, editor, next) => {
    let mark

    if (isBoldHotkey(event)) {
      mark = 'bold'
    } else if (isItalicHotkey(event)) {
      mark = 'italic'
    } else if (isUnderlinedHotkey(event)) {
      mark = 'underlined'
    } else if (isCodeHotkey(event)) {
      mark = 'code'
    } else if (isRecontextualize(event)) {
      //   mark = 'recontextualize-hook'
      console.log('mod+r clicked do insert the button')
      this.editor.insertText('[x]')
    } else {
      return next()
    }

    event.preventDefault()
    editor.toggleMark(mark)
    // window.alert('onkeydown')
  }

  renderNode = (props, editor, next) => {
    const { attributes, children, node } = props
    switch (node.type) {
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>
      case 'list-item': // this is the node inside either bulleted-list or numbered-list
        return <li {...attributes}>{children}</li>
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>
      default:
        return next()
    }
  }

  /**
 * Render a Slate mark.
 *
 *
 * TODO: renderMark for recontext Hook
 * @param {Object} props
 * @return {Element}
 */

  renderMark = (props, editor, next) => {
    const { children, mark, attributes } = props

    switch (mark.type) {
      case 'bold':
        return (
          <strong {...attributes}>
            {children}
          </strong>
        )
      case 'code':
        return <code {...attributes}>{children}</code>
      case 'italic':
        return <em {...attributes}>{children}</em>
      case 'underlined':
        // console.log(editor.value.inlines.get(0))
        return <u {...attributes}>{children}</u>
      case 'recontextualize-hook':
        return (
          /* always use {children} https://github.com/ianstormtaylor/slate/issues/2142 */
          <Button
            //TODO: add hover function back!! 
            // onMouseOver={() => {
            //   const textBeforeHook = props.node.text.substring(0, props.offset)
            //   this.props.onHoverHighlightCurrentUserInput(textBeforeHook)
            // }}
            // onMouseOut={() => {
            //   const textBeforeHook = props.node.text.substring(0, props.offset)
            //   this.props.offHoverHighlightCurrentUserInput(textBeforeHook)
            // }}
            // {...attributes} //attributes has few information
            style={{ color: 'ForestGreen' }}
          >
            <b>{children}</b>
          </Button>
        )
      case 'mechanism-span':
        return <b style={{ color: 'SteelBlue' }}>{children}</b> // color codes https://www.quackit.com/css/css_color_codes.cfm
      case 'purpose-span':
        return <b style={{ color: 'Salmon' }}>{children}</b>
      default:
        return next()
    }
  }

  decorateNode = (node, editor, next) => {
    const others = next() || []
    let decorations = []
    let startText = node.getFirstText()

    let re = /\[x\]/g
    re.lastIndex = 0
    // The lastIndex is a read/write integer property of regular expression 
    // instances that specifies the index at which to start the next match.
    let str = startText.text
    var match

    while ((match = re.exec(str)) !== null) {
      const dec = {
        anchor: {
          key: startText.key,
          offset: match.index,
        },
        focus: {
          key: startText.key,
          offset: match.index + 3,
        },
        mark: {
          type: 'recontextualize-hook',
        },
      }
      decorations.push(dec)
    }

    re = /[Ww]ith/g
    re.lastIndex = 0
    str = startText.text

    if ((match = re.exec(str)) !== null) {
      const dec = {
        anchor: {
          key: startText.key,
          offset: match.index,
        },
        focus: {
          key: startText.key,
          offset: str.length - 1// match.index + 10,
        },
        mark: {
          type: 'mechanism-span',
        },
      }
      decorations.push(dec)
    }

    re = /[Tt]o /g
    re.lastIndex = 0
    str = startText.text

    if ((match = re.exec(str)) !== null) {
      const dec = {
        anchor: {
          key: startText.key,
          offset: match.index,
        },
        focus: {
          key: startText.key,
          offset: str.length// match.index + 10,
        },
        mark: {
          type: 'purpose-span',
        },
      }
      decorations.push(dec)
    }

    // editor.deselect().focus() //Or other commands??
    return [...others, ...decorations]
  }

  render() {
    return (
      <div>
        <Toolbar>
          {this.renderMarkButton('bold' as SlateTypes, <MdFormatBold {...this.iconProps} />)}
          {this.renderMarkButton('italic' as SlateTypes, <MdFormatItalic {...this.iconProps} />)}
          {this.renderMarkButton('underlined' as SlateTypes, <MdFormatUnderlined {...this.iconProps} />)}
          {this.renderMarkButton('code' as SlateTypes, <MdCode {...this.iconProps} />)}
          {this.renderBlockButton('heading-one' as SlateTypes, <MdLooksOne {...this.iconProps} />)}
          {this.renderBlockButton('heading-two' as SlateTypes, <MdLooksTwo {...this.iconProps} />)}
          {this.renderBlockButton('block-quote' as SlateTypes, <MdFormatQuote {...this.iconProps} />)}
          {this.renderBlockButton('numbered-list' as SlateTypes, <MdFormatListNumbered {...this.iconProps} />)}
          {this.renderBlockButton('bulleted-list' as SlateTypes, <MdFormatListBulleted {...this.iconProps} />)}
          {this.renderMarkButton(
            'recontextualize_hook' as SlateTypes, <MdFindInPage {...this.iconProps}><div>cmd+r</div></MdFindInPage>)}

          {/* TODO when user click this button, it will insert into current cursor position a reconteztualize hook, e.g. [cite!] or [x] */}
          {/* <LinkButton /> */}
        </Toolbar>

        <Editor
          spellCheck
          autoFocus
          placeholder="Enter some rich text..."
          ref={this.ref as any}
          // ref={this.refRealEditor as any}
          value={this.state.value}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          renderNode={this.renderNode}
          renderMark={this.renderMark}
          // onMouseDown={this.onMouseDown}
          // onMouseUp={this.onMouseUp}
          decorateNode={this.decorateNode}
        // onClick={this.onClick}
        // plugins={plugins}
        />
      </div>

    )
  }
}


