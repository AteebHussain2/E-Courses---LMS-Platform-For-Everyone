import FileUpload from "@/components/inputs/FileUpload"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

const AddCoursesPage = () => {
    return (
        <div className="grid grid-cols-3 gap-5">
            <div>
                Course Card
            </div>
            <form className="col-span-2 space-y-5">
                <FileUpload title="Add Course Photo" />
                <Card>
                    <CardContent>
                        <Textarea
                            className="bg-input! border-border border appearance-none"
                        />
                    </CardContent>
                </Card>
            </form>
        </div >
    )
}

export default AddCoursesPage
