import { LoaderFunction, MetaFunction, useLoaderData } from 'remix'
import { authenticator } from '~/auth/auth.server'
import { AssessmentFeed } from '~/components/AssessmentFeed'
import { db } from '~/db/db.server'
import { Assessment } from '~/lib/types'
import { convertToDate } from '~/lib/utils'

export const meta: MetaFunction = () => {
  return {
    title: 'Monthly Assessments',
    description: 'Your monthly assessments.',
  }
}

type LoaderData = {
  assessments: Array<Assessment>
}

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  })

  const dbAssessments = await db.assessment.findMany({
    where: {
      AND: [
        {
          type: 'MONTHLY',
        },
        {
          userId: user.id,
        },
      ],
    },
    include: {
      questionsAnswers: true,
    },
  })

  const assessments = dbAssessments.map((assessment) => ({
    ...assessment,
    createdAt: convertToDate(assessment.createdAt),
  }))

  return { assessments }
}

export default function Monthly() {
  const { assessments } = useLoaderData<LoaderData>()

  return <AssessmentFeed assessments={assessments} />
}
