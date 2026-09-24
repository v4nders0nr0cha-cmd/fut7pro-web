import BlogEditorForm from "../BlogEditorForm";

export default async function EditarArtigoBlogPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <BlogEditorForm postId={params.id} />;
}
