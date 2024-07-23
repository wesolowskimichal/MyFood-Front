import { Children, cloneElement, isValidElement, ReactElement, ReactNode, useCallback, useState } from 'react'
import { LayoutAnimation, Pressable, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { toggleAnimation } from '../../animations/ToggleAnimation'

type CollapsibleProps = {
  defaultCollapse?: boolean
  children: [ReactElement<typeof CollapsibleHeader>, ReactElement<typeof CollapsibleContent>]
  collapsibleStyle?: StyleProp<ViewStyle>
  headerStyle?: StyleProp<ViewStyle>
}

type CollapsibleComponentProps = {
  children: ReactNode
  itemStyle?: StyleProp<ViewStyle>
}

export const CollapsibleHeader = ({ children, itemStyle }: CollapsibleComponentProps) => (
  <View style={itemStyle}>{children}</View>
)

export const CollapsibleContent = ({ children, itemStyle }: CollapsibleComponentProps) => (
  <ScrollView style={itemStyle} nestedScrollEnabled>
    {children}
  </ScrollView>
)

const Collapsible = ({ children, collapsibleStyle, headerStyle, defaultCollapse = true }: CollapsibleProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapse)

  let header: ReactNode | null = null
  let content: ReactNode | null = null

  Children.forEach(children, child => {
    if (isValidElement(child) && child.type === CollapsibleHeader) {
      header = cloneElement(child)
    } else if (isValidElement(child) && child.type === CollapsibleContent) {
      content = child
    } else {
      throw new Error('Collapsible children must be of type CollapsibleHeader and CollapsibleContent')
    }
  })

  const handleCollapseClick = useCallback(() => {
    LayoutAnimation.configureNext(toggleAnimation)
    setIsCollapsed(prev => !prev)
  }, [])

  return (
    <View style={[collapsibleStyle, { overflow: 'hidden' }]}>
      <Pressable onPress={handleCollapseClick}>{header}</Pressable>
      {!isCollapsed && <View style={{ flex: 1 }}>{content}</View>}
    </View>
  )
}

export default Collapsible
