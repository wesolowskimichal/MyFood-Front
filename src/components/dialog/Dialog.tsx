import { Children, cloneElement, isValidElement, ReactElement, ReactNode, useState } from 'react'
import { Modal, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

type DialogProps = {
  children: ReactElement[] | ReactElement
  style?: StyleProp<ViewStyle>
  visible: boolean
  setVisible: (visible: boolean) => void
}
type DialogComponentProps = {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}

export const DialogTrigger = ({ children, style }: DialogComponentProps) => <View style={style}>{children}</View>
export const DialogContent = ({ children, style }: DialogComponentProps) => <View style={style}>{children}</View>

const Dialog = ({ children, style, visible, setVisible }: DialogProps) => {
  let trigger: ReactNode | null = null
  let content: ReactNode | null = null

  Children.forEach(children, child => {
    if (isValidElement(child) && child.type === DialogTrigger) {
      trigger = child
    } else if (isValidElement(child) && child.type === DialogContent) {
      content = child
    }
  })

  return (
    <View style={style}>
      {trigger && <Pressable onPress={() => setVisible(true)}>{trigger}</Pressable>}
      <Modal visible={visible} animationType="fade" transparent onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.DialogOut} onPress={() => setVisible(false)}>
          {content && <View style={styles.DialogContainer}>{content}</View>}
          {!trigger && !content && children}
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  DialogContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 4,
    marginHorizontal: 20
  },
  DialogOut: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
})

export default Dialog
