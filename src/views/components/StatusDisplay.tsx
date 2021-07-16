interface Props {
  message?: String;
}

interface Children {
  title: String;
  children: React.ReactNode;
  color: "red" | "blue" | "yellow";
}

const Wrapper: React.VFC<Children> = ({ title, children, color }) => {
  return (
    <div
      className={`flex flex-col justify-center w-full h-full p-3 text-center text-white bg-${color}-800 text-sm`}
    >
      <p className="text-4xl">{title}</p>
      {children}
    </div>
  );
};

const Loading: React.VFC<Props> = ({ message }) => {
  return (
    <Wrapper color="blue" title="Loading...">
      {message && <p>{message}</p>}
    </Wrapper>
  );
};

const Error: React.VFC<Props> = ({ message }) => {
  return (
    <Wrapper color="red" title="Uh oh!">
      {message && <p>{message}</p>}
    </Wrapper>
  );
};

export { Loading, Error };
