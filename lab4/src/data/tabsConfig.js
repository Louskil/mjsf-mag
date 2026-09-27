import OverviewPanel from '../components/demo-panels/OverviewPanel.vue'
import RequirementsPanel from '../components/demo-panels/RequirementsPanel.vue'
import EnvironmentPanel from '../components/demo-panels/EnvironmentPanel.vue'

export const pillsTabsConfig = [
  {
    slug: 'overview',
    title: 'Огляд',
    panel: OverviewPanel,
    panelProps: {},
  },
  {
    slug: 'requirements',
    title: 'Вимоги',
    panel: RequirementsPanel,
    panelProps: {},
  },
  {
    slug: 'environment',
    title: 'Середовище',
    panel: EnvironmentPanel,
    panelProps: {},
  },
]
