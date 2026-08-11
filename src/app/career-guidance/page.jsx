import CareerGuidanceForm from './components/CareerGuidanceForm'

export default async function CareerGuidancePage({ searchParams }) {
  const params = await searchParams
  const initialCourse =
    typeof params?.course === 'string' ? params.course : ''

  return <CareerGuidanceForm initialCourse={initialCourse} />
}
