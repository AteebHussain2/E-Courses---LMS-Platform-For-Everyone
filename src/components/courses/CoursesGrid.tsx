import { CourseWithInstructorAndCount } from '@/lib/types';
import AdminCourseCard from './cards/AdminCourseCard';

type CoursesGridProps = {
    isLoading: boolean,
    courses?: CourseWithInstructorAndCount[]
}

const CoursesGrid = ({ isLoading = true, courses }: CoursesGridProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-5">
            {!isLoading ? courses?.map(course => (
                <AdminCourseCard key={course.id} course={course} />
            )) : (
                <>Loading...</>
            )}
        </div>
    )
}

export default CoursesGrid