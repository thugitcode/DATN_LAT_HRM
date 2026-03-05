import FileCard from "./components/file-card";
import { Header } from "./components/header"
import { PageFilter } from "./components/page-filter"
export interface FileItem {
    id: string;
    thumbnail: string;
    title: string;
    note?: string;
    size: string;
    author: string;
    datetime: string;
}

export const mockFiles: FileItem[] = [
    {
        id: "1",
        thumbnail: "https://images.pexels.com/photos/17146786/pexels-photo-17146786.jpeg",
        title: "Hồ sơ",
        note: "Ghi chú",
        size: "PDF - 5.2 KB",
        author: "Admin",
        datetime: "12:21 12/01/2026",
    },
    {
        id: "2",
        thumbnail: "https://images.pexels.com/photos/17146786/pexels-photo-17146786.jpeg",
        title: "Hợp đồng lao động",
        note: "Bản ký chính thức",
        size: "PDF - 1.2 MB",
        author: "HR Team",
        datetime: "09:45 10/01/2026",
    },
    {
        id: "3",
        thumbnail: "https://images.pexels.com/photos/17146786/pexels-photo-17146786.jpeg",
        title: "Chính sách công ty",
        note: "Phiên bản cập nhật",
        size: "PDF - 850 KB",
        author: "Admin",
        datetime: "14:02 05/01/2026",
    },
    {
        id: "4",
        thumbnail: "https://images.pexels.com/photos/17146786/pexels-photo-17146786.jpeg",
        title: "Báo cáo tháng 12",
        note: "Internal use only",
        size: "PDF - 2.4 MB",
        author: "Kế toán",
        datetime: "16:30 02/01/2026",
    },
];
export const ProfileStaff = () => {
    return (
        <div className="flex flex-col gap-3.75">
            <Header />
            <PageFilter />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(246px,1fr))] gap-6">
                {mockFiles.map((file) => (
                    <FileCard
                        key={file.id}
                        {...file}
                        onDownload={() => console.log("Download", file.id)}
                        onMore={() => console.log("More", file.id)}
                    />
                ))}
            </div>
        </div>
    )
}