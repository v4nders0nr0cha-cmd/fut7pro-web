import BlogEditorForm from "../BlogEditorForm";

export default function EditarArtigoBlogPage({ params }: { params: { id: string } }) {
  return <BlogEditorForm postId={params.id} />;
}
