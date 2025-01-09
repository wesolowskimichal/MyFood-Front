import { Pressable, ScrollView, Text, View } from 'react-native'
import { SettingsScreenProps } from '../../types/Types'
import { useGetUserQuery } from '../../redux/api/slices/UserApiSlice'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import { AppDispatch, RootState } from '../../redux/Store'
import { useDispatch, useSelector } from 'react-redux'
import { ReactNode } from 'react'
import { Image } from 'expo-image'
import Loader from '../../components/loader/Loader'
import EmbeddedSwitch from '../../components/embeddedSwitch/EmbeddedSwitch'
import { toggleTheme } from '../../redux/slices/ThemeSlice'
import { DarkThemeColors, LightThemeColors } from '../../constants/colors'

const Settings = ({ navigation }: SettingsScreenProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const colors = useSelector((state: RootState) => state.theme.colors)
  const theme = useSelector((state: RootState) => state.theme.theme)

  const { data: user, error, isLoading } = useGetUserQuery()

  if (error) return <Text>{error as string}</Text>
  console.log(theme)

  if (isLoading || !user) return <Loader />

  return (
    <ScreenWrapper>
      <ScrollView style={{ padding: 8 }}>
        <Section title="Account">
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
            <Image source={{ uri: user?.picture }} style={{ flex: 1, aspectRatio: 1, borderRadius: 4 }} />
            <View style={{ flex: 2 }}>
              <UserField title="Name" value={`${user.first_name} ${user.last_name}`} />
              <UserField title="Username" value={user.username} />
              <UserField title="Email" value={user.email} />
            </View>
          </View>
        </Section>
        <Section title="Settings">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            <Text style={{ color: colors.neutral.text, fontSize: 16, fontWeight: '500' }}>Theme: </Text>
            <EmbeddedSwitch
              leftOption={
                <Text
                  style={{
                    backgroundColor: LightThemeColors.primary,
                    paddingVertical: 4,
                    paddingHorizontal: 12,
                    color: LightThemeColors.neutral.text,
                    fontWeight: '600'
                  }}
                >
                  Light
                </Text>
              }
              rightOption={
                <Text
                  style={{
                    backgroundColor: DarkThemeColors.primary,
                    paddingVertical: 4,
                    paddingHorizontal: 12,
                    color: DarkThemeColors.neutral.text,
                    fontWeight: '600'
                  }}
                >
                  Dark
                </Text>
              }
              checked={theme === 'dark'}
              onSwitchToggle={() => dispatch(toggleTheme())}
            />
          </View>
          <Pressable
            style={{ padding: 8, backgroundColor: colors.neutral.background, borderRadius: 4 }}
            onPress={() => navigation.navigate('MealsConfig')}
          >
            <Text style={{ color: colors.neutral.text, fontWeight: '500' }}>Meals Configuration</Text>
          </Pressable>
        </Section>
      </ScrollView>
    </ScreenWrapper>
  )
}

const UserField = ({ title, value }: { title: string; value: string }) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  return (
    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
      <Text style={{ fontWeight: '600', fontSize: 14, color: colors.accent }}>{title}: </Text>
      <Text style={{ fontSize: 14, color: colors.neutral.text }}>{value}</Text>
    </View>
  )
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.accent,
          marginBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.accent,
          paddingHorizontal: 2
        }}
      >
        {title}
      </Text>
      <View style={{ padding: 4 }}>{children}</View>
    </View>
  )
}

export default Settings
