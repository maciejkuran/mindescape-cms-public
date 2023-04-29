import Image from 'next/image';

const Custom404Page = () => {
  return (
    <section>
      <div>
        <Image src="/images/404.svg" height={300} width={300} alt="404 error" />
      </div>
      <h1>Oops nothing found! 😥</h1>
      <p>Sorry, this page does not exist.</p>
    </section>
  );
};

export default Custom404Page;
