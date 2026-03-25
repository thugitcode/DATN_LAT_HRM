import { uploadQueryOptions } from "@/services/query-options/upload.query";
import { useQuery } from "@tanstack/react-query";

const GetSignedUrl = ({
    children,
    url,
}: {
    children: (data: any) => React.ReactNode;
    url: string;
}) => {
    const { data: res } = useQuery(uploadQueryOptions.signedUrl(url || ""));

    return <>{children(res?.data)}</>;
};

export default GetSignedUrl;