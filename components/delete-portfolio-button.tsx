'use client'

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DeletePortfolioButtonProps {
    portfolioId: string
}

export function DeletePortfolioButton({ portfolioId }: DeletePortfolioButtonProps) {
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) {
            return
        }

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                alert('You must be logged in to delete portfolios')
                return
            }

            const { error } = await supabase
                .from('portfolios')
                .delete()
                .eq('id', portfolioId)
                .eq('user_id', user.id) // Ensure only owner can delete

            if (error) {
                console.error('Error deleting portfolio:', error)
                alert('Failed to delete portfolio. Please try again.')
            } else {
                // Refresh the page to show updated list
                router.refresh()
            }
        } catch (error) {
            console.error('Error deleting portfolio:', error)
            alert('Failed to delete portfolio. Please try again.')
        }
    }

    return (
        <Button
            type="button"
            variant="destructive"
            size="sm"
            className="w-full bg-red-600 hover:bg-red-700"
            onClick={handleDelete}
        >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
        </Button>
    )
}