import DashboardIcon from '../components/icons/DashboardIcon'
import { PlaceholderPage } from './Placeholder'

export function HomePage() {
  return (
    <PlaceholderPage
      title="داشبورد"
      description="خلاصه فعالیت‌ها و آمار حساب از اینجا نمایش داده می‌شود."
      icon={<DashboardIcon width={28} height={28} />}
    />
  )
}
