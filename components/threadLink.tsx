import Link from 'next/link';

type Props = {
  channelName: string;
  linkName: string;
};

export default function ThreadLink({ channelName, linkName }: Props) {
  return (
    <li className="mb-4">
      <Link
        className="text-gray-700 border-b-2 border-gray-700 hover:border-send-button hover:text-gray-700 text-xl"
        href={{
          pathname: '/chats',
          query: { channel_name: channelName },
        }}
      >
        {linkName}
      </Link>
    </li>
  );
}
