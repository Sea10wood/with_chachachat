type Props = {
  dateString: string;
};

export default function DateFormatter({ dateString }: Props) {
  const date = new Date(dateString);
  const jstDate = date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  return <>{jstDate}</>;
}
