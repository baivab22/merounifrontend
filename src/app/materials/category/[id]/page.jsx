import { getMaterialCategories } from '../../action'
import MaterialsCategoryContent from './Content'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
    const { id } = await params
    try {
        const categories = await getMaterialCategories()
        let categoryName = ''
        
        if (id === 'unlisted') {
            categoryName = 'Unlisted Materials'
        } else {
            const category = categories.find(cat => cat.id.toString() === id)
            if (category) categoryName = category.name
        }

        const title = categoryName ? `${categoryName} Materials | MeroUni` : 'Study Materials | MeroUni'
        const description = `Browse and download ${categoryName || 'study'} materials, notes, and resources on MeroUni.`

        return {
            title: title,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/materials/category/${id}`,
                type: 'website',
                siteName: 'MeroUni'
            },
            twitter: {
                card: 'summary',
                title: title,
                description: description,
            }
        }
    } catch (error) {
        return { title: 'Study Materials | MeroUni' }
    }
}

export default async function MaterialsCategoryPage({ params }) {
    const { id } = await params
    let categories = []
    let initialCategoryName = ''
    
    try {
        categories = await getMaterialCategories()
        if (id === 'unlisted') {
            initialCategoryName = 'Unlisted'
        } else {
            const category = categories.find(cat => cat.id.toString() === id)
            if (category) initialCategoryName = category.name
        }
    } catch (error) {
        console.error('Error fetching categories:', error)
    }

    if (!initialCategoryName && id !== 'unlisted') {
        notFound()
    }

    return (
        <MaterialsCategoryContent 
            categoryIdFromUrl={id} 
            initialCategoryName={initialCategoryName} 
            categories={categories} 
        />
    )
}
